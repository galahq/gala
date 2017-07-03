# frozen_string_literal: true

class CustomizeDeploymentService
  def initialize(deployment, author_id, lti_uid)
    @deployment = deployment
    @author_identifier = AuthorIdentifier.new author_id, lti_uid
  end

  def customize(answers_needed: 0, quiz_id: nil, custom_questions: [])
    if answers_needed.zero?
      @deployment.answers_needed = 0
      @deployment.save
      return @deployment
    end

    begin
      ActiveRecord::Base.transaction do
        @deployment.answers_needed = answers_needed

        @deployment.quiz = find_quiz quiz_id
        delete_questions_not_included_in(custom_questions.map { |q| q['id'] })
        upsert_questions custom_questions
        set_quiz_author

        @deployment.save!
      end
    rescue ActiveRecord::RecordInvalid => invalid
      return invalid.record
    end

    @deployment
  end

  private

  def set_quiz_author
    @deployment.quiz.update @author_identifier.quiz_attributes
  end

  def find_quiz(quiz_id)
    quiz = Quiz.where(id: quiz_id).try(:first)
    if quiz && @author_identifier.author.quiz?(quiz)
      quiz
    else
      create_quiz_from_template quiz_id
    end
  end

  def create_quiz_from_template(template_id)
    Quiz.create! case: @deployment.case,
                 template_id: template_id,
                 customized: true
  end

  def delete_questions_not_included_in(question_ids)
    @deployment.quiz.custom_questions.each do |question|
      question.destroy unless question_ids.include? question.id
    end
  end

  def upsert_questions(custom_questions)
    custom_questions.each do |question|
      if question['id']
        Question.find(question['id']).update! question
      else
        @deployment.quiz.custom_questions.create! question
      end
    end
  end

  class AuthorIdentifier
    attr_accessor :author_id, :lti_uid

    def initialize(author_id, lti_uid)
      @author_id = author_id
      @lti_uid = lti_uid
    end

    def author
      @author ||= Reader.find author_id
    end

    def quiz_attributes
      if @author_id
        { 'author_id' => @author_id, 'lti_uid' => nil }
      else
        { 'author_id' => nil, 'lti_uid' => @lti_uid }
      end
    end
  end
end
