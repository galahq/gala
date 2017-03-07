require 'optparse'
require 'csv'
require 'active_support/core_ext/hash/indifferent_access'

def fatal_error message
  $stderr.puts message
  exit
end

options = {}

opt_parser = OptionParser.new do |opt|
  opt.banner = "Usage: ruby ./batch-add-users.rb USERLIST [OPTIONS] | rails c"
  opt.separator ""
  opt.separator "USERLIST should be a CSV file with headers, including columns 'name' and 'email'."
  opt.separator ""
  opt.separator "Options"

  opt.on("-g", "--group GROUP", "Create a new group with name GROUP and add users") do |group|
    options[:group] = group
  end

  opt.on("-r", "--reverse-name", "Accept names as Last, First and reverse them") do
    options[:reverse_name] = true
  end

  opt.on("-h", "--help", "Print this help message") do
    fatal_error opt_parser
  end
end

opt_parser.parse!

filename = ARGV[0]
unless filename
  fatal_error opt_parser
end

begin
  csv_text = File.read filename
rescue Exception
  fatal_error "Error: File '#{filename}' does not exist or cannot be read"
end
csv = CSV.parse csv_text, headers: true

headers = csv.headers
unless headers.include?("name") && headers.include?("email")
  fatal_error <<-END
Error: Malformed file.
       CSV content must include columns 'name' and 'email'
END
end

puts "readers = []"

csv.each do |row|
  row = row.to_hash.with_indifferent_access
  puts "reader = Reader.find_or_initialize_by email: %{#{row[:email].downcase}}"
  puts "unless reader.persisted?"

  if options[:reverse_name]
    puts "  reader.name = %{#{row[:name].split(',').map(&:strip).reverse.join(' ')}}"
  else
    puts "  reader.name = %{#{row[:name]}}"
  end

  puts "  reader.password = Devise.friendly_token[0,20]"
  puts "  reader.initials = reader.name.split(' ').map(&:first).join('')"
  puts "  reader.save"
  puts "end"
  puts "readers << reader"
end

if options[:group]
  puts "group = Group.create name: %{#{options[:group]}}"

  puts "readers.each do |r|"
  puts "  group.group_memberships.create reader: r"
  puts "end"
end
