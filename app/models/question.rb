class Question < ActiveRecord::Base
  attr_accessible :category, :difficulty, :question, :answers_attributes, :category_id
  has_many :answers, :dependent => :destroy
  has_many :question_contents
  has_many :content_sets, :through => :question_contents
  belongs_to :category

  accepts_nested_attributes_for :answers, :reject_if => lambda{|answer| answer[:answer].blank?}

  def as_json(options={})
    {:question => question, :answers => answers, :category => category, :difficulty => difficulty}
  end

  # Validations
  validates_presence_of :question
  validate :validate_answers

  def validate_answers
    @numCorrect = 0
    answers.each do |answer|
      if answer.correct == true
        @numCorrect+=1
      end
    end

    # logger.info("=============" + @numCorrect)

    # logger.debug @numCorrect
    if @numCorrect > 1
      errors.add("You can only have 1 correct answer", "")
    elsif @numCorrect < 1
      errors.add("You must have 1 correct answer", "")
    end
  end

  # Scope
  scope :all, order(:id)
  scope :byid, order(:id)

end
