class AddActiveToContentSet < ActiveRecord::Migration
  def change
    add_column :content_sets, :active, :boolean
  end
end
