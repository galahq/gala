class CustomizeDeploymentService

  def initialize deployment
    @deployment = deployment
  end

  def customize answers_needed: 0, template_id: nil, custom_questions: [],
    author_id: nil, lti_uid: nil

    if answers_needed == 0
      @deployment.answers_needed = 0
      @deployment.save
      return @deployment
    end

    begin
      ActiveRecord::Base.transaction do
        @deployment.answers_needed = answers_needed

        if custom_questions.empty?
          @deployment.quiz = Quiz.find template_id
        else
          @deployment.quiz = create_quiz_from_template template_id
          create_questions custom_questions
          set_quiz_author author_id, lti_uid
        end

        @deployment.save!

      end
    rescue ActiveRecord::RecordInvalid => invalid
      return invalid.record
    end

    @deployment
  end

  private
  def set_quiz_author author_id, lti_uid
    if author_id
      @deployment.quiz.update author_id: author_id, lti_uid: nil
    else
      @deployment.quiz.update author_id: nil, lti_uid: lti_uid
    end
  end

  def create_quiz_from_template template_id
    Quiz.create! case: @deployment.case, template_id: template_id, customized: true
  end

  def create_questions custom_questions
    custom_questions.each do |question|
      @deployment.quiz.custom_questions.create! question
    end
  end

end
