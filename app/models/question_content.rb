class QuestionContent < ActiveRecord::Base
  attr_accessible :content_set_id, :question_id
  belongs_to :question
  belongs_to :content_set
end
