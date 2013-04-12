class CreateContentSets < ActiveRecord::Migration
  def change
    create_table :content_sets do |t|
      t.string :name
      t.date :date
      t.boolean :active

      t.timestamps
    end
  end
end
