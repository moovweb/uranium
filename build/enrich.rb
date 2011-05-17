# Script to build uranium into a single file
#############################################
# TODO - To support the blackberry/IE xui versions, I can just add different yaml files
# 

require 'yaml'

if ARGV.size == 0
  puts "Syntax: ruby enrich.rb  build_config_name"
  exit
end

prefix = ARGV[0]

options = []
options << ["compilation_level", "SIMPLE_OPTIMIZATIONS"] #"SIMPLE_OPTIMIZATIONS"
options << ["js_output_file", "uranium.js"]

build_options = YAML::load(File.open(ARGV[0],"r") {|f| f.read} )

files = [build_options[:external],
         build_options[:global],
         build_options[:widgets]].flatten 

puts "Compiling:"
puts "-"*10   
puts files
puts "-"*10   

files.each do |widget|
  options << ["js", File.join("../",widget)]
end

options.collect! do |option|
  "--#{option[0]} #{option[1]}"
end

%x`java -jar ./compiler/compiler.jar #{options.join(" ")}`
