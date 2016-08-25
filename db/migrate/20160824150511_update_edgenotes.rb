class UpdateEdgenotes < ActiveRecord::Migration
  def up
    Edgenote.find_by_slug("gray-wolf").update(
      thumbnail_url: "http://msc-gala.imgix.net/gray-wolf.jpg",
      url: "http://msc-gala.imgix.net/gray-wolf.jpg"
    )
    Edgenote.find_by_slug("gray-wolf-range").update(
      thumbnail_url: "http://msc-gala.imgix.net/gray-wolf-range.jpg",
      url: "http://msc-gala.imgix.net/gray-wolf-range.jpg",
      instructions: "Notice that the range has dramatically shrunk. (example)"
    )
    Edgenote.find_by_slug('chinese-investment-in-transportation').update(
      content: '<iframe src="https://www.youtube.com/embed/2QTO-zNqe5Y" frameborder="0" allowfullscreen="true"></iframe>'
    )
  end

  def down
  end
end
