class AddCategoryIdToQuestions < ActiveRecord::Migration
  def change
    add_column :questions, :category_id, :integer
  end
end
