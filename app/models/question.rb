class Question < ActiveRecord::Base
  attr_accessible :category, :difficulty, :question
  has_many :answers
  has_many :question_contents
  has_many :content_sets, :through => :question_contents
end
