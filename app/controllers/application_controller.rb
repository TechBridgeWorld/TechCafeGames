class ApplicationController < ActionController::Base
  include ControllerAuthentication
  protect_from_forgery

  	rescue_from CanCan::AccessDenied do |exception|
	  flash[:error] = "You're not authorized to view this page. Please log in with correct credentials."
	  redirect_to root_url
	end

end
