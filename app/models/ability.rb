class Ability
  include CanCan::Ability

  def initialize(user)
	user ||= User.new # guest user (not logged in)
	if user.is_admin?
		can :manage, :all
	elsif user.is_teacher?
		can :manage, Question
		can :manage, ContentSet
		can :edit, User, :id => user.id
	else
		can :create, User
	end
  end
end
