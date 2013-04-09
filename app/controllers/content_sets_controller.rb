class ContentSetsController < ApplicationController

  skip_before_filter :login_required, :only => [:new, :create] 

# before_filter :login_required

  # GET /content_sets
  # GET /content_sets.json
  def index
    @content_sets = ContentSet.order(params[:sort])
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: ContentSet.list.to_json }
    end

  end

  # GET /content_sets/1
  # GET /content_sets/1.json
  def show
    @content_set = ContentSet.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @content_set }
    end
  end

  # GET /content_sets/new
  # GET /content_sets/new.json
  def new
    @content_set = ContentSet.new
    @questions = Question.order(params[:sort])

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @content_set }
    end
  end

  # GET /content_sets/1/edit
  def edit
    @content_set = ContentSet.find(params[:id])
    @questions = Question.order(params[:sort])
  end

  # POST /content_sets
  # POST /content_sets.json
  def create
    @content_set = ContentSet.new(params[:content_set])

    @content_set.user = current_user

    respond_to do |format|
      if @content_set.save
        format.html { redirect_to @content_set, notice: 'Content set was successfully created.' }
        format.json { render json: @content_set, status: :created, location: @content_set }
      else
        format.html { render action: "new" }
        format.json { render json: @content_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /content_sets/1
  # PUT /content_sets/1.json
  def update
    @content_set = ContentSet.find(params[:id])

    respond_to do |format|
      if @content_set.update_attributes(params[:content_set])
        format.html { redirect_to @content_set, notice: 'Content set was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @content_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /content_sets/1
  # DELETE /content_sets/1.json
  def destroy
    @content_set = ContentSet.find(params[:id])
    @content_set.destroy

    respond_to do |format|
      format.html { redirect_to content_sets_url }
      format.json { head :no_content }
    end
  end
end
