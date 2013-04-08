class ContentSet < ActiveRecord::Base
  attr_accessible :date, :name, :question_ids
  has_many :question_contents
  has_many :questions, :through => :question_contents
  belongs_to :user

  def as_json(options={})
    {:name => name, :questions => questions}
  end

end

