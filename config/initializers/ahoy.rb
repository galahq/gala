class Ahoy::Store < Ahoy::Stores::ActiveRecordTokenStore
  def user
    controller.current_reader
  end
end
