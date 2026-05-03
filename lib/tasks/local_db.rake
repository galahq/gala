# frozen_string_literal: true

require 'digest'
require 'fileutils'
require 'json'
require 'open3'
require 'pathname'
require 'shellwords'
require 'tmpdir'

module LocalDb
  class DumpRestore
    DB_SERVICE = 'db'
    DB_NAME = 'gala'
    DB_USER = 'gala'
    DB_IMAGE = 'postgres:16.8'
    DUMP_MOUNT = '/sqldumps'
    DUMP_ROOT = Pathname.new(File.expand_path('../../db/sqldump', __dir__))
    STRUCTURE_PATH = Pathname.new(File.expand_path('../../db/structure.sql', __dir__))
    TMP_ROOT = Pathname.new(File.expand_path('../../tmp/local_db_restore', __dir__))

    def initialize(filename:, backup: true)
      @filename = filename
      @backup = backup
      @dump_path = resolve_dump_path(filename)
      @dump_mount_path = "#{DUMP_MOUNT}/#{@dump_path.basename}"
      @verify_db_name = "#{DB_NAME}_dump_verify_#{Time.now.to_i}"
      FileUtils.mkdir_p(TMP_ROOT)
    end

    def run!
      verify_local_assets!
      verify_compose_service!
      verify_running_container!
      verify_schema_match!
      backup_current_database! if @backup
      replace_local_database!
      run_smoke_checks!
      puts "✅ Restored #{@dump_path.basename} into compose service '#{DB_SERVICE}' database '#{DB_NAME}'."
    ensure
      drop_database(@verify_db_name) if @verify_db_name
    end

    private

    def resolve_dump_path(filename)
      raise ArgumentError, usage_banner if filename.to_s.strip.empty?

      candidate = DUMP_ROOT.join(File.basename(filename)).expand_path
      return candidate if candidate.file? && candidate.to_s.start_with?(DUMP_ROOT.expand_path.to_s + File::SEPARATOR)

      raise ArgumentError, "Dump file not found under #{DUMP_ROOT}: #{filename}"
    end

    def usage_banner
      'Usage: bundle exec rake local_db:restore_dump[seed.dump]'
    end

    def verify_local_assets!
      raise 'Missing db/structure.sql' unless STRUCTURE_PATH.file?
      raise "Missing dump directory: #{DUMP_ROOT}" unless DUMP_ROOT.directory?
    end

    def verify_compose_service!
      services = run_capture!('docker', 'compose', 'config', '--services').lines.map(&:strip)
      raise "docker-compose is missing the '#{DB_SERVICE}' service" unless services.include?(DB_SERVICE)
    end

    def verify_running_container!
      @container_id = run_capture!('docker', 'compose', 'ps', '-q', DB_SERVICE).strip
      raise "Compose service '#{DB_SERVICE}' is not running. Start it with `docker compose up -d #{DB_SERVICE}`." if @container_id.empty?

      inspect_payload = run_capture!('docker', 'inspect', @container_id)
      container = JSON.parse(inspect_payload).fetch(0)
      labels = container.fetch('Config', {}).fetch('Labels', {})
      image = container.fetch('Config', {}).fetch('Image', '')
      mounts = container.fetch('Mounts', [])
      port_bindings = container.fetch('HostConfig', {}).fetch('PortBindings', {})

      raise "Refusing to target non-compose service: #{labels['com.docker.compose.service'].inspect}" unless labels['com.docker.compose.service'] == DB_SERVICE
      raise "Refusing to target #{image}; expected #{DB_IMAGE}" unless image == DB_IMAGE
      raise 'Refusing to restore because the db container publishes postgres to the host. Keep it internal to docker compose only.' unless port_bindings.empty?

      expected_source = DUMP_ROOT.expand_path.to_s
      dump_mount = mounts.find { |mount| mount['Destination'] == DUMP_MOUNT }
      raise "Expected #{expected_source} to be mounted at #{DUMP_MOUNT}" unless dump_mount
      raise "Expected dump mount source #{expected_source}, got #{dump_mount['Source']}" unless dump_mount['Source'] == expected_source
      raise 'Expected dump mount to be read-only' if dump_mount['RW']
    end

    def verify_schema_match!
      puts "Verifying #{@dump_path.basename} against db/structure.sql..."
      create_database(@verify_db_name)
      restore_into(@verify_db_name)

      restored_schema = run_capture!(
        'docker', 'compose', 'exec', '-T', DB_SERVICE,
        'pg_dump', '--schema-only', '--no-owner', '--no-privileges', '-U', DB_USER, '-d', @verify_db_name
      )

      expected = normalize_schema(STRUCTURE_PATH.read)
      actual = normalize_schema(restored_schema)
      return if expected == actual

      restored_path = TMP_ROOT.join("#{@dump_path.basename}.schema.sql")
      File.write(restored_path, restored_schema)
      raise <<~MSG
        Dump schema does not match db/structure.sql.
        Expected structure: #{STRUCTURE_PATH}
        Restored structure: #{restored_path}
      MSG
    ensure
      drop_database(@verify_db_name)
      @verify_db_name = nil
    end

    def backup_current_database!
      timestamp = Time.now.utc.strftime('%Y%m%d%H%M%S')
      backup_dir = Pathname.new(File.expand_path('../../tmp/db-backups', __dir__))
      FileUtils.mkdir_p(backup_dir)
      backup_path = backup_dir.join("#{DB_NAME}-before-restore-#{timestamp}.dump")
      puts "Backing up #{DB_NAME} to #{backup_path}..."
      dump = run_capture!(
        'docker', 'compose', 'exec', '-T', DB_SERVICE,
        'pg_dump', '-Fc', '-U', DB_USER, '-d', DB_NAME
      )
      File.binwrite(backup_path, dump)
    end

    def replace_local_database!
      puts "Replacing compose database '#{DB_NAME}' from #{@dump_path.basename}..."
      terminate_connections(DB_NAME)
      drop_database(DB_NAME)
      create_database(DB_NAME)
      restore_into(DB_NAME)
    end

    def run_smoke_checks!
      puts 'Running post-restore smoke checks...'

      [
        {
          label: 'cases count',
          sql: 'SELECT COUNT(*) FROM public.cases;',
          expect_rows: true
        },
        {
          label: 'readers count',
          sql: 'SELECT COUNT(*) FROM public.readers;',
          expect_rows: true
        },
        {
          label: 'sample published cases',
          sql: "SELECT COALESCE(NULLIF(title, ''), slug) AS label FROM public.cases ORDER BY published_at DESC NULLS LAST, id DESC LIMIT 3;",
          expect_rows: true
        },
        {
          label: 'sample reader emails',
          sql: "SELECT email FROM public.readers WHERE email <> '' ORDER BY id DESC LIMIT 3;",
          expect_rows: true
        }
      ].each do |query|
        output = run_sql(query[:sql])
        values = output.lines.map(&:strip).reject(&:empty?)
        raise "Smoke check failed: #{query[:label]} returned no rows" if query[:expect_rows] && values.empty?

        puts "  • #{query[:label]}: #{values.join(', ')}"
      end
    end

    def create_database(name)
      run_command!(
        'docker', 'compose', 'exec', '-T', DB_SERVICE,
        'createdb', '-U', DB_USER, name
      )
    end

    def drop_database(name)
      terminate_connections(name)
      run_command!(
        'docker', 'compose', 'exec', '-T', DB_SERVICE,
        'dropdb', '--if-exists', '-U', DB_USER, name
      )
    end

    def terminate_connections(name)
      sql = <<~SQL.gsub("\n", ' ')
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '#{name}'
          AND pid <> pg_backend_pid();
      SQL

      run_command!(
        'docker', 'compose', 'exec', '-T', DB_SERVICE,
        'psql', '-v', 'ON_ERROR_STOP=1', '-U', DB_USER, '-d', 'postgres', '-c', sql
      )
    end

    def restore_into(name)
      if sql_dump?
        run_command!(
          'docker', 'compose', 'exec', '-T', DB_SERVICE,
          'psql', '-v', 'ON_ERROR_STOP=1', '-U', DB_USER, '-d', name, '-f', @dump_mount_path
        )
      else
        run_command!(
          'docker', 'compose', 'exec', '-T', DB_SERVICE,
          'pg_restore', '--clean', '--if-exists', '--no-owner', '--no-privileges',
          '-U', DB_USER, '-d', name, @dump_mount_path
        )
      end
    end

    def run_sql(sql)
      run_capture!(
        'docker', 'compose', 'exec', '-T', DB_SERVICE,
        'psql', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-U', DB_USER, '-d', DB_NAME, '-c', sql
      )
    end

    def sql_dump?
      @dump_path.extname == '.sql'
    end

    def normalize_schema(content)
      normalized_lines = []
      skip_schema_migrations_insert = false

      content.each_line do |line|
        stripped = line.strip

        if skip_schema_migrations_insert
          skip_schema_migrations_insert = !stripped.end_with?(';')
          next
        end

        next if stripped.empty?
        next if line.start_with?('--')
        next if line.start_with?('SET ')
        next if line.start_with?('SELECT pg_catalog.set_config')
        next if line.start_with?('\\connect')
        next if stripped == 'CREATE SCHEMA heroku_ext;'

        if stripped.start_with?('INSERT INTO "schema_migrations"')
          skip_schema_migrations_insert = !stripped.end_with?(';')
          next
        end

        normalized_lines << line.gsub(/\s+/, ' ').strip
      end

      Digest::SHA256.hexdigest(normalized_lines.join("\n"))
    end

    def run_capture!(*command)
      stdout, stderr, status = Open3.capture3(*command)
      return stdout if status.success?

      raise "Command failed (#{Shellwords.join(command)}):\n#{stderr.to_s.empty? ? stdout : stderr}"
    end

    def run_command!(*command)
      stdout, stderr, status = Open3.capture3(*command)
      return if status.success?

      raise "Command failed (#{Shellwords.join(command)}):\n#{stderr.to_s.empty? ? stdout : stderr}"
    end
  end
end

namespace :local_db do
  desc 'Restore a mounted dump from db/sqldump into the compose postgres service after schema verification'
  task :restore_dump, [:filename] do |_task, args|
    backup = ENV.fetch('BACKUP', '1') != '0'
    LocalDb::DumpRestore.new(filename: args[:filename] || ENV['FILE'], backup: backup).run!
  end
end
