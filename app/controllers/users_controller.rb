class UsersController < ApplicationController
  # before_filter :login_required, :except => [:new, :create]
  skip_before_filter :login_required, :only => [:new, :create] 

  load_and_authorize_resource


  # GET /questions
  # GET /questions.json
  def index
    @users = User.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @users.to_json(:only => :username, :include_content_sets => params[:include_content_sets]) }
    end
  end

  def new
    @user = User.new
    @users = User.all
  end

  def show
    @user = User.find_by_id(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user.to_json(:only => :username, :include_content_sets => params[:include_content_sets]) }
    end
  end

  def create
    @user = User.new(params[:user])
    if @user.save
      if (current_user && current_user.is_admin?)
        redirect_to users_path, :notice => "New user created."
      else
        session[:user_id] = @user.id
        redirect_to content_sets_path, :notice => "Thank you for signing up! You are now logged in."
      end
    else
      render :action => 'new'
    end
  end

  def edit
    @user = current_user
  end

  def update
    @user = current_user
    if @user.update_attributes(params[:user])
      redirect_to root_url, :notice => "Your profile has been updated."
    else
      render :action => 'edit'
    end
  end
end
