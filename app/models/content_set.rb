class ContentSet < ActiveRecord::Base
  attr_accessible :date, :name, :question_ids, :active, :user_id
  has_many :question_contents
  has_many :questions, :through => :question_contents
  belongs_to :user

  def as_json(options={})
    {:name => name, :questions => questions}
  end

  def self.list
    result = {}
    active.each do |content_set|
      result[content_set.name] = content_set.questions
    end
    result
  end

  # Validations
  validates_presence_of :name

  validate :has_questions?
  def has_questions?
    logger.debug "========= checking has questions ========="
    logger.debug self.questions.length
    if self.questions.length<1
      errors.add("A content set must have at least 1 question.", "")
    end
  end

  # Scope
  scope :all, order(:id)
  scope :byid, order(:id)
  scope :active, where(active: true)
end