# This file is used by Rack-based servers to start the application.

config.assets.precompile += %w( bootstrap.css )
require ::File.expand_path('../config/environment',  __FILE__)
run TeacherPortal::Application