class CustomizeDeploymentService

  def initialize deployment
    @deployment = deployment
  end

  def customize answers_needed: 0, template_id: nil, custom_questions: []
    return @deployment if answers_needed == 0

    begin
      ActiveRecord::Base.transaction do
        @deployment.answers_needed = answers_needed

        if custom_questions.empty?
          @deployment.quiz = Quiz.find template_id
        else
          @deployment.quiz = create_quiz_from_template template_id
          create_questions custom_questions
        end

        @deployment.save!

      end
    rescue ActiveRecord::RecordInvalid => invalid
      return invalid.record
    end

    @deployment
  end

  private
  def create_quiz_from_template template_id
    Quiz.create! case: @deployment.case, template_id: template_id, customized: true
  end

  def create_questions custom_questions
    custom_questions.each do |question|
      @deployment.quiz.questions.create! question
    end
  end

end
