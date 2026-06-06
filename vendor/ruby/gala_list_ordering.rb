# frozen_string_literal: true

module GalaListOrdering
  extend ActiveSupport::Concern

  class_methods do
    def acts_as_list(scope: nil, column: :position)
      class_attribute :gala_list_ordering_options,
                      instance_accessor: false,
                      default: {
                        scope: Array(scope).map(&:to_s),
                        column: column.to_s
                      }

      before_validation :gala_assign_list_position, on: :create
      before_create :gala_open_list_position
      before_update :gala_reorder_list_position
      after_destroy :gala_close_list_position
    end

    def acts_as_list_no_update
      previous = Thread.current[gala_list_ordering_disabled_key]
      Thread.current[gala_list_ordering_disabled_key] = true
      yield
    ensure
      Thread.current[gala_list_ordering_disabled_key] = previous
    end

    def gala_list_ordering_disabled_key
      :"#{name}.gala_list_ordering_disabled"
    end
  end

  def insert_at(position)
    update!(gala_list_position_column => position)
  end

  def move_higher
    return false if public_send(gala_list_position_column).to_i <= 1

    update(gala_list_position_column => public_send(gala_list_position_column).to_i - 1)
  end

  def move_lower
    update(gala_list_position_column => public_send(gala_list_position_column).to_i + 1)
  end

  def move_to_top
    update(gala_list_position_column => 1)
  end

  def move_to_bottom
    update(gala_list_position_column => gala_list_scope_relation.maximum(gala_list_position_column))
  end

  private

  def gala_assign_list_position
    return if gala_list_ordering_disabled?

    current_position = public_send(gala_list_position_column)
    return if current_position.to_i.positive?

    public_send("#{gala_list_position_column}=",
                gala_list_scope_relation.maximum(gala_list_position_column).to_i + 1)
  end

  def gala_open_list_position
    return if gala_list_ordering_disabled?

    position = [public_send(gala_list_position_column).to_i, 1].max
    max_position = gala_list_scope_relation.maximum(gala_list_position_column).to_i + 1
    position = [position, max_position].min
    public_send("#{gala_list_position_column}=", position)

    gala_list_scope_relation
      .where("#{gala_quoted_list_position_column} >= ?", position)
      .update_all(gala_list_position_increment_sql)
  end

  def gala_reorder_list_position
    return if gala_list_ordering_disabled?
    return unless will_save_change_to_attribute?(gala_list_position_column)

    old_position, desired_position =
      attribute_change_to_be_saved(gala_list_position_column).map(&:to_i)
    new_position = gala_clamped_list_position(desired_position)
    public_send("#{gala_list_position_column}=", new_position)
    return if old_position == new_position

    siblings = gala_list_scope_relation.where.not(self.class.primary_key => id)

    if new_position < old_position
      siblings
        .where("#{gala_quoted_list_position_column} >= ? AND #{gala_quoted_list_position_column} < ?",
               new_position, old_position)
        .update_all(gala_list_position_increment_sql)
    else
      siblings
        .where("#{gala_quoted_list_position_column} <= ? AND #{gala_quoted_list_position_column} > ?",
               new_position, old_position)
        .update_all(gala_list_position_decrement_sql)
    end
  end

  def gala_close_list_position
    return if gala_list_ordering_disabled?

    position = public_send(gala_list_position_column).to_i
    return unless position.positive?

    gala_list_scope_relation
      .where("#{gala_quoted_list_position_column} > ?", position)
      .update_all(gala_list_position_decrement_sql)
  end

  def gala_clamped_list_position(position)
    max_position = gala_list_scope_relation.maximum(gala_list_position_column).to_i
    max_position = 1 if max_position.zero?

    [[position.to_i, 1].max, max_position].min
  end

  def gala_list_scope_relation
    self.class.unscoped.yield_self do |relation|
      self.class.gala_list_ordering_options.fetch(:scope).reduce(relation) do |scope, name|
        association = self.class.reflect_on_association(name.to_sym)

        if association&.belongs_to?
          scope.where(association.foreign_key => public_send(association.foreign_key))
        else
          scope.where(name => public_send(name))
        end
      end
    end
  end

  def gala_list_position_column
    self.class.gala_list_ordering_options.fetch(:column)
  end

  def gala_quoted_list_position_column
    self.class.connection.quote_column_name(gala_list_position_column)
  end

  def gala_list_position_increment_sql
    "#{gala_quoted_list_position_column} = #{gala_quoted_list_position_column} + 1"
  end

  def gala_list_position_decrement_sql
    "#{gala_quoted_list_position_column} = #{gala_quoted_list_position_column} - 1"
  end

  def gala_list_ordering_disabled?
    Thread.current[self.class.gala_list_ordering_disabled_key]
  end
end
