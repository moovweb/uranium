#! /usr/local/rvm/rubies/ruby-1.9.2-p180/bin/ruby
require 'rdiscount'

if ARGV.size > 0
  prefix = ARGV[0].split(".").first
  content = File.read(ARGV[0])
  rd = RDiscount.new(content)
  File.open(prefix + ".html", "w") {|f| f << rd.to_html }
else

  this_directory = %x`pwd`
  this_directory.strip!

  files = Dir.open(this_directory) 
  puts files.entries
  files = files.sort.entries[2..-1]

  files.each do |file|
    prefix = file.split(".").first
    content = File.read(File.join(this_directory, file))
    rd = RDiscount.new(content)
    File.open(prefix + ".html", "w") {|f| f << rd.to_html }
  end

end
