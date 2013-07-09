class AddUserIdToContentSets < ActiveRecord::Migration
  def change
    add_column :content_sets, :user_id, :integer
  end
end
