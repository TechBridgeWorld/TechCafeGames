class UsersController < ApplicationController
  # before_filter :login_required, :except => [:new, :create]

  load_and_authorize_resource

  skip_authorize_resource :only => [:teacher_list,:teacher_content]

  # GET /questions
  # GET /questions.json
  def index
    @users = User.all

    respond_to do |format|
      format.html # index.html.erb
    end
  end

  def teacher_list
    @users = User.all
    respond_to do |format|
      format.json { render json: @users.to_json(:only => :username, :include_content_sets => params[:include_content_sets]) }
    end 
  end 

  def new
    @user = User.new
    @users = User.all
  end

  def teacher_content
    @user = ::User.find_by_username(params[:name])

    respond_to do |format|
      format.json { render json: @user.to_json(:only => :username, :include_content_sets => params[:include_content_sets]) }
    end 
  end 

  def show
    @user = User.find_by_id(params[:id])

    respond_to do |format|
      format.html # show.html.erb
    end
  end

  def create
    @user = User.new(params[:user])
    @users = User.all
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
    @user = User.find_by_id(params[:id])
    @users = User.all
  end

  def update
    @user = current_user
    @users = User.all
    if @user.update_attributes(params[:user])
      redirect_to root_url, :notice => "Your profile has been updated."
    else
      render :action => 'edit'
    end
  end
end
