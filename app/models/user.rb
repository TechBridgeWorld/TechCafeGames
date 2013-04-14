class User < ActiveRecord::Base
  # new columns need to be added here to be writable through mass assignment
  attr_accessible :username, :email, :password, :password_confirmation, :role

  attr_accessor :password
  before_save :prepare_password

  has_many :content_sets

  validates_presence_of :username
  validates_uniqueness_of :username, :email, :allow_blank => true
  validates_format_of :username, :with => /^[-\w\._@]+$/i, :allow_blank => true, :message => "should only contain letters, numbers, or .-_@"
  validates_format_of :email, :with => /^[-a-z0-9_+\.]+\@([-a-z0-9]+\.)+[a-z0-9]{2,4}$/i
  validates_presence_of :password, :on => :create
  validates_confirmation_of :password
  validates_length_of :password, :minimum => 4, :allow_blank => true

  # Roles!!

  ROLES = [['Admin', :admin],['Teacher', :teacher]]
  
   def role?(authorized_role)
     return false if role.nil?
     role.downcase.to_sym == authorized_role
   end

   def is_admin?
     role == "admin"
   end

   def is_teacher?
     role == "teacher"
   end




  def as_json(options)
    results = {:username => username}
    if (options[:include_content_sets] == "true")
      results.merge!({:content_sets => content_sets})
    end
    super(options).merge(results)
  end

  # login can be either username or email address
  def self.authenticate(login, pass)
    user = find_by_username(login) || find_by_email(login)
    return user if user && user.password_hash == user.encrypt_password(pass)
  end

  def encrypt_password(pass)
    BCrypt::Engine.hash_secret(pass, password_salt)
  end

  private

  def prepare_password
    unless password.blank?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = encrypt_password(password)
    end
  end
end
