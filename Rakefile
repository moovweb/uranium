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

task :upload => [:enrich] do
  require 'manhattan_uploader'

  version = File.read("VERSION").strip
  if File.exists? "JENKINS"
    version += "."
    version += File.read("JENKINS").strip
  end

  buildf = File.open("BUILD_VERSION", 'w')
  buildf.puts version
  buildf.close

  ManhattanUploader.run(File.expand_path("."), "build/src", false)
end

task :default => [:enrich]
