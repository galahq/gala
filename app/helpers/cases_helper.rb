module CasesHelper
  def title_for_catalog c
    return c.short_title if c.featured? && !c.short_title.blank?
    c.title
  end
end
