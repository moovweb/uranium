# Script to build uranium into a single file

# TODO
# - This should eventually have options for webkit/blackberry/ie versions as well


if ARGV[0].nil? 
  puts "Required js code file argument."
  return
end

code = File.open(ARGV[0],"r") {|f| f.read}

options = []
options << "js_code=#{code}"
options << "compilation_level=SIMPLE_OPTIMIZATIONS"
options << "output_format=text"
options << "output_info=compiled_code"

m = Mechanize.new
result = m.post("http://closure-compiler.appspot.com/compile?#{options.join('&')}")
File.open("uranium.js","w") { f << result.body }
