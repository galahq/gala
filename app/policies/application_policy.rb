# frozen_string_literal: true

# @abstract
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    editor?
  end

  def show?
    scope.where(id: record.id).exists?
  end

  def create?
    editor?
  end

  def new?
    create?
  end

  def update?
    editor?
  end

  def edit?
    update?
  end

  def destroy?
    editor?
  end

  def scope
    Pundit.policy_scope!(user, record.class)
  end

  # @abstract
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      if editor?
        scope.all
      else
        scope.none
      end
    end

    private

    def editor?
      user.has_cached_role? :editor
    end
  end

  private

  def editor?
    user.has_cached_role? :editor
  end
end
