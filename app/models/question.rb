class Question < ActiveRecord::Base
  attr_accessible :category, :difficulty, :question, :answers_attributes
  has_many :answers, :dependent => :destroy
  has_many :question_contents
  has_many :content_sets, :through => :question_contents

  accepts_nested_attributes_for :answers, :reject_if => lambda{|answer| answer[:answer].blank?}

  # Validations
  validates_presence_of :question

  # Scope
  scope :all, order(:id)
  scope :byid, order(:id)

end
