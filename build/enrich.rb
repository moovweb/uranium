# Script to build uranium into a single file
require 'yaml'
require 'mechanize'

# TODO
# - This should eventually have options for webkit/blackberry/ie versions as well

# http://dl.dropbox.com/u/3940085/moovweb/Core/widgets

if ARGV.size < 2
  puts "Syntax: ruby enrich.rb url_prefix build_config.yaml"
  exit
end

prefix = ARGV[0]

options = []
options << ["compilation_level", "WHITESPACE_ONLY"] #"SIMPLE_OPTIMIZATIONS"
options << ["output_format", "json"]
options << ["output_info", "compiled_code"]
options << ["output_info", "warnings"]
options << ["output_info", "errors"]
options << ["output_info", "statistics"]


build_options = YAML::load(File.open(ARGV[1],"r") {|f| f.read} )
puts build_options

options << ["code_url", "#{prefix}#{build_options[:external]}"]
options << ["code_url", "#{prefix}#{build_options[:global]}"]
options << ["js_code", " "]

build_options[:widgets].each do |widget|
  options << ["code_url", "#{prefix}#{widget}"]
end

m = Mechanize.new
result = m.post("http://closure-compiler.appspot.com/compile", options, { "Content-type" => "application/x-www-form-urlencoded" })

puts result.code

File.open("uranium.js","w") {|f| f << result.body }
