# frozen_string_literal: true

require 'delegate'

module Gala
  # Instruments Pundit policy predicates and policy scopes so development logs
  # can surface authorization code that issues repeated SQL.
  module PunditQueryWatch
    IGNORED_SQL_NAMES = %w[SCHEMA TRANSACTION].freeze
    THREAD_DEPTH_KEY = :gala_pundit_query_watch_depth
    DEFAULT_MAX_QUERIES = 3
    DEFAULT_REPEAT_THRESHOLD = 2

    class << self
      attr_writer :enabled, :max_queries, :repeat_threshold

      def enabled?
        return @enabled unless @enabled.nil?

        Rails.env.development?
      end

      def reset_request!(controller = nil)
        Current.pundit_query_watch_events = []
        Current.pundit_query_watch_request = request_label(controller)
      end

      def flush_request!(controller = nil)
        return unless enabled?

        events = Current.pundit_query_watch_events || []
        request = Current.pundit_query_watch_request || request_label(controller)
        repeated = repeated_fingerprints(events)
        return if repeated.empty?

        repeated.first(3).each do |fingerprint, count|
          Rails.logger.warn(
            '[pundit-query-watch] possible authorization N+1 ' \
              "request=#{request} repeated_queries=#{count} " \
              "sql=#{fingerprint} checks=#{checks_for(events, fingerprint)}"
          )
        end
      ensure
        Current.pundit_query_watch_events = []
        Current.pundit_query_watch_request = nil
      end

      def observe(check, user, record)
        return yield unless enabled?
        return yield if nested?

        self.depth += 1
        queries = []
        callback = sql_callback(queries)
        result = nil

        ActiveSupport::Notifications.subscribed(
          callback,
          'sql.active_record'
        ) do
          result = yield
        end

        record_check(check, user, record, queries)
        result
      ensure
        self.depth -= 1 if enabled? && depth.positive?
      end

      def wrap_policy(policy, user, record)
        return policy unless enabled?
        return policy if policy.nil? || policy.is_a?(InstrumentedPolicy)

        InstrumentedPolicy.new(policy, user, record)
      end

      private

      def sql_callback(queries)
        lambda do |_name, _started, _finished, _id, payload|
          fingerprint = sql_fingerprint(payload)
          queries << fingerprint if fingerprint
        end
      end

      def sql_fingerprint(payload)
        return if payload[:cached]
        return if IGNORED_SQL_NAMES.include?(payload[:name].to_s)

        sql = payload[:sql].to_s
        return if sql.blank?
        return if sql.match?(/\A(?:BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)\b/i)

        sql
          .gsub(/'[^']*'/, '?')
          .gsub(/\b\d+\b/, '?')
          .squish
      end

      def record_check(check, user, record, queries)
        return if queries.empty?

        event = {
          check: check,
          user: label_for(user),
          record: label_for(record),
          queries: queries,
          repeated: queries.tally.select { |_sql, count| count >= repeat_threshold }
        }

        Current.pundit_query_watch_events << event if
          Current.pundit_query_watch_events
        warn_for_check(event) if event[:queries].length > max_queries ||
                                 event[:repeated].present?
      end

      def warn_for_check(event)
        Rails.logger.warn(
          '[pundit-query-watch] policy check issued SQL ' \
            "check=#{event[:check]} user=#{event[:user]} " \
            "record=#{event[:record]} queries=#{event[:queries].length} " \
            "repeated=#{event[:repeated].keys.first}"
        )
      end

      def repeated_fingerprints(events)
        events
          .flat_map { |event| event[:queries] }
          .tally
          .select { |_fingerprint, count| count >= repeat_threshold }
          .sort_by { |_fingerprint, count| -count }
      end

      def checks_for(events, fingerprint)
        events
          .select { |event| event[:queries].include?(fingerprint) }
          .map { |event| event[:check] }
          .uniq
          .first(5)
          .join(',')
      end

      def max_queries
        @max_queries || DEFAULT_MAX_QUERIES
      end

      def repeat_threshold
        @repeat_threshold || DEFAULT_REPEAT_THRESHOLD
      end

      def request_label(controller)
        return 'non-request' unless controller&.respond_to?(:request)

        "#{controller.request.request_method} #{controller.request.fullpath}"
      end

      def label_for(object)
        return object.name if object.is_a?(Class)

        label = object.class.name
        return label unless object.respond_to?(:id) && object.id

        "#{label}(#{object.id})"
      end

      def nested?
        depth.positive?
      end

      def depth
        Thread.current[THREAD_DEPTH_KEY] ||= 0
      end

      def depth=(value)
        Thread.current[THREAD_DEPTH_KEY] = value
      end
    end

    class InstrumentedPolicy < SimpleDelegator
      def initialize(policy, user, record)
        super(policy)
        @policy = policy
        @user = user
        @record = record
      end

      def public_send(method_name, *args, &block)
        return super unless predicate?(method_name)

        Gala::PunditQueryWatch.observe(
          "#{@policy.class.name}##{method_name}",
          @user,
          @record
        ) { @policy.public_send(method_name, *args, &block) }
      end

      def method_missing(method_name, *args, &block)
        return super unless predicate?(method_name)

        Gala::PunditQueryWatch.observe(
          "#{@policy.class.name}##{method_name}",
          @user,
          @record
        ) { @policy.public_send(method_name, *args, &block) }
      end

      def respond_to_missing?(method_name, include_private = false)
        @policy.respond_to?(method_name, include_private) || super
      end

      private

      def predicate?(method_name)
        method_name.to_s.end_with?('?')
      end
    end

    module PunditMethods
      def authorize(user, record, query, policy_class: nil)
        Gala::PunditQueryWatch.observe("Pundit.authorize##{query}", user, record) do
          super
        end
      end

      def policy(user, record)
        Gala::PunditQueryWatch.wrap_policy(super, user, record)
      end

      def policy!(user, record)
        Gala::PunditQueryWatch.wrap_policy(super, user, record)
      end

      def policy_scope(user, scope)
        Gala::PunditQueryWatch.observe('Pundit.policy_scope', user, scope) do
          super
        end
      end

      def policy_scope!(user, scope)
        Gala::PunditQueryWatch.observe('Pundit.policy_scope!', user, scope) do
          super
        end
      end
    end

    module ControllerHooks
      extend ActiveSupport::Concern

      included do
        before_action { Gala::PunditQueryWatch.reset_request!(self) }
        after_action { Gala::PunditQueryWatch.flush_request!(self) }
      end
    end
  end
end
