class Answer < ActiveRecord::Base
  attr_accessible :answer, :correct, :question_id
  belongs_to :question

  def as_json(options={})
    {:answer => answer, :correct => correct}
  end

end
