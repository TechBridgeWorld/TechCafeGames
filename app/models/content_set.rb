class ContentSet < ActiveRecord::Base
  attr_accessible :date, :name
  has_many :question_contents
  has_many :questions, :through => :question_contents
end
