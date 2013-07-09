class CreateQuestionContents < ActiveRecord::Migration
  def change
    create_table :question_contents do |t|
      t.integer :content_set_id
      t.integer :question_id

      t.timestamps
    end
  end
end
