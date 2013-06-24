class QuestionsController < ApplicationController
  skip_before_filter :login_required, :only => [:new, :create] 

  load_and_authorize_resource

  # before_filter :login_required

  # GET /questions
  # GET /questions.json
  def index
    @questions = Question.order(params[:sort])

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @questions }
    end
  end

  # GET /questions/1
  # GET /questions/1.json
  def show
    @question = Question.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @question }
    end
  end

  # GET /questions/new
  # GET /questions/new.json
  def new
    @question = Question.new

    4.times do
      answer = @question.answers.build
    end

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @question }
    end
  end

  # GET /questions/1/edit
  def edit
    @question = Question.find(params[:id])
    @answersLeft = 4-@question.answers.length

    @answersLeft.times do
      answer = @question.answers.build
    end
  end

  # POST /questions
  # POST /questions.json
  def create
    @question = Question.new(params[:question])
    @answersLeft = 4-@question.answers.length

    @answersLeft.times do
      answer = @question.answers.build
    end

    respond_to do |format|
      if @question.save
        format.html { redirect_to questions_path, notice: 'Question was successfully created.' }
        format.json { render json: @question, status: :created, location: @question }
      else
        format.html { render action: "new" }
        format.json { render json: @question.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /questions/1
  # PUT /questions/1.json
  def update
    @question = Question.find(params[:id])
    @answersLeft = 4-@question.answers.length

    @answersLeft.times do
      answer = @question.answers.build
    end

    respond_to do |format|
      if @question.update_attributes(params[:question])
        format.html { redirect_to questions_path, notice: 'Question was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @question.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /questions/1
  # DELETE /questions/1.json
  def destroy
    @question = Question.find(params[:id])
    @question.destroy

    #############################################################################
    # Code added by Gary (Beginning Block)

    # Since a question will be deleted, check if deleting this question will result in the corresponding content set having zero questions.
    # If this is the case then the corresponding content set must be marked as inactive so it does not show up in the Brain Race game.
    # NOTE: This solution is a poor solution (N+1) problem. But since I do not know how to do this query in the confines of this RoR app,
    #	    I had to get something working ASAP. The proper way to do this woould be to modify the code in the following models content_set.rb,
    #	    question.rb and question_content.rb and also modyfy the code in the following controllers questions_controller.rb and content_sets_controller.rb 
    #	    (and possibly add a new controller for the question_contents) in order to handle this query operation more eloquently.

    foreignKey = @question.id
    query1 = "SELECT content_set_id FROM question_contents WHERE question_id=#{foreignKey}"
    logger.debug "Query 1: " + query1
    @questionContentsResults = ActiveRecord::Base.connection.execute(query1)

    logger.debug "--------------------------------------------------------"

    # Beginning For loop
    @questionContentsResults.each do |currentContentSetIdHash|

      currentContentSetIdStr = currentContentSetIdHash["content_set_id"]
      currentContentSetId = currentContentSetIdStr.to_i

      logger.debug "Current Content Set ID = #{currentContentSetId} and current class #{currentContentSetId.class}"

      query2 = "SELECT COUNT(content_set_id) FROM question_contents WHERE content_set_id=#{currentContentSetId}"
      logger.debug "Query 2: " + query2
      @numberOfQueryResults = ActiveRecord::Base.connection.execute(query2)

      @numberOfQueryResults.each do |currentQueryResultCount|
	logger.debug "Current Query Result Count is #{currentQueryResultCount}"

	currentCountStr = currentQueryResultCount["count"]
	currentCount    = currentCountStr.to_i

	logger.debug "Current Count for content_set_id #{currentContentSetId} is #{currentCount}"

	# This meams that if there is either one entry (current entry about to be deleted), then this content set must be set to inactive since there are not questions
	if (currentCount < 2)	
	  query3 = "UPDATE content_sets SET active=false WHERE id=#{currentContentSetId}"
	  ActiveRecord::Base.connection.execute(query3)
	  logger.debug "Query 3: " + query3
	else
	  logger.debug "Query 3: No need to toggle active flag on content_set with ID #{currentContentSetId}"
	end

      end

    end
    # End For loop

    # Delete the actual question reference from the question_content table
    query4 = "DELETE FROM question_contents WHERE question_id=#{foreignKey}"
    logger.debug "Query 4: " + query4
    ActiveRecord::Base.connection.execute(query4)

    logger.debug "--------------------------------------------------------"

    # Code added by Gary (End Block)
    #############################################################################
    
    respond_to do |format|
      format.html { redirect_to questions_url }
      format.json { head :no_content }
    end
  end
end
