class ContentSet < ActiveRecord::Base
  attr_accessible :date, :name, :question_ids
  has_many :question_contents
  has_many :questions, :through => :question_contents
  belongs_to :user

  def as_json(options={})
    {:name => name, :questions => questions}
  end

  def self.list
    result = {}
    all.each do |content_set|
      result[content_set.name] = content_set.questions
    end
    result
  end

  # Validations
  validates_presence_of :name

  # Scope
  scope :all, order(:id)
end