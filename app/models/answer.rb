class Answer < ActiveRecord::Base
  attr_accessible :answer, :correct, :question_id
  belongs_to :question
end
