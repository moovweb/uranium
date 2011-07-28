task :enrich do
  require 'fusion'     

  modes = {"pretty-bundles" => Fusion::Quick, "optimized-bundles" => Fusion::Optimized}
  # The old pretty mode would remove comments and auto-indent ... I should add that to fusion

  modes.each do |bundle_name, compiler|
    puts "Building (#{bundle_name})"

    bundles = File.join(File.expand_path("."),"build/#{bundle_name}.yml")
    
    Fusion::configure({:bundle_file_path => bundles})
    this_compiler = compiler.new
    this_compiler.run
  end

end

task :upload do #=> [:enrich] do
  require 'manhattan_uploader'
  require 'rdiscount'
  require 'erb'


  version = File.read("VERSION").strip
  if File.exists? "JENKINS"
    version += "."
    version += File.read("JENKINS").strip
  end

  buildf = File.open("BUILD_VERSION", 'w')
  buildf.puts version
  buildf.close

  urls = ManhattanUploader.run(File.expand_path("."), "build/src", false)

  puts "Uploaded urls:"
  puts urls
  
  urls.first =~ /(\d+\.\d+\.\d+)/

  raise Exception.new("Could not extract version from url : (#{urls.first})") if $1.nil?

  version = $1

  latest_page = File.open("build/latest.md.erb").read
  md = ERB.new(latest_page).result(binding)
  File.open("template.md","w") {|f| f << md}  

  latest_page = RDiscount.new(md).to_html

  File.open("latest.html","w") {|f| f << latest_page}


end

task :default => [:enrich]
