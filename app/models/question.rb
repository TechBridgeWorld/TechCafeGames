class Question < ActiveRecord::Base
  attr_accessible :category, :difficulty, :question, :answers_attributes
  has_many :answers, :dependent => :destroy
  has_many :question_contents
  has_many :content_sets, :through => :question_contents

  accepts_nested_attributes_for :answers, :reject_if => lambda{|answer| answer[:answer].blank?}

  def as_json(options={})
    {:question => question, :answers => answers, :category => category, :difficulty => difficulty}
  end

  # Validations
  validates_presence_of :question

  # Scope
  scope :all, order(:id)

end
