class CreateContentSets < ActiveRecord::Migration
  def change
    create_table :content_sets do |t|
      t.string :name
      t.date :date

      t.timestamps
    end
  end
end
