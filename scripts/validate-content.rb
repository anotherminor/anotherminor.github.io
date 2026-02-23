#!/usr/bin/env ruby

require "yaml"
require "date"
require "time"
require "uri"

ROOT = File.expand_path("..", __dir__)
POST_GLOB = File.join(ROOT, "content", "posts", "**", "index.md")
FRONT_MATTER_RE = /\A---\s*\n(.*?)\n---\s*(?:\n|\z)/m

ALLOWED_CATEGORIES = %w[rambling entertainment tech].freeze
ALLOWED_FORMATS = %w[news link].freeze
REQUIRED_KEYS = %w[title date draft slug categories].freeze

def rel(path)
  path.sub(%r{\A#{Regexp.escape(ROOT)}/?}, "")
end

def parse_front_matter(path)
  src = File.read(path)
  match = src.match(FRONT_MATTER_RE)
  return [:error, "missing YAML front matter"] unless match

  yaml = YAML.safe_load(match[1], permitted_classes: [Time, Date], aliases: true)
  yaml = {} if yaml.nil?
  return [:ok, yaml] if yaml.is_a?(Hash)

  [:error, "front matter root must be a mapping"]
rescue Psych::Exception => e
  [:error, "YAML parse error: #{e.message}"]
end

def blank_string?(value)
  value.is_a?(String) && value.strip.empty?
end

def valid_datetime?(value)
  return true if value.is_a?(Time) || value.is_a?(Date) || value.is_a?(DateTime)
  return false unless value.is_a?(String) && !value.strip.empty?

  Time.parse(value)
  true
rescue ArgumentError
  false
end

def valid_http_url?(value)
  return false unless value.is_a?(String) && !value.strip.empty?

  uri = URI.parse(value)
  %w[http https].include?(uri.scheme) && !uri.host.to_s.empty?
rescue URI::InvalidURIError
  false
end

errors = []
warnings = []
stats = {
  posts: 0,
  link_posts: 0,
  formatted_posts: 0
}

post_paths = Dir.glob(POST_GLOB).sort

if post_paths.empty?
  warn "No post files matched: #{POST_GLOB}"
  exit 1
end

post_paths.each do |path|
  stats[:posts] += 1
  status, data_or_error = parse_front_matter(path)
  if status == :error
    errors << "#{rel(path)}: #{data_or_error}"
    next
  end

  fm = data_or_error

  REQUIRED_KEYS.each do |key|
    errors << "#{rel(path)}: missing required field `#{key}`" unless fm.key?(key)
  end

  if fm.key?("title")
    unless fm["title"].is_a?(String) && !fm["title"].strip.empty?
      errors << "#{rel(path)}: `title` must be a non-empty string"
    end
  end

  if fm.key?("slug")
    unless fm["slug"].is_a?(String) && !fm["slug"].strip.empty?
      errors << "#{rel(path)}: `slug` must be a non-empty string"
    end
  end

  if fm.key?("date") && !valid_datetime?(fm["date"])
    errors << "#{rel(path)}: `date` must be a valid datetime"
  end

  if fm.key?("updated") && !fm["updated"].nil? && !blank_string?(fm["updated"]) && !valid_datetime?(fm["updated"])
    errors << "#{rel(path)}: `updated` must be a valid datetime when provided"
  end

  if fm.key?("draft") && ![true, false].include?(fm["draft"])
    errors << "#{rel(path)}: `draft` must be boolean true/false"
  end

  if fm.key?("categories")
    categories = fm["categories"]
    if !categories.is_a?(Array)
      errors << "#{rel(path)}: `categories` must be an array"
    else
      errors << "#{rel(path)}: `categories` must contain exactly one item" unless categories.length == 1
      invalid = categories.reject { |c| ALLOWED_CATEGORIES.include?(c.to_s) }
      unless invalid.empty?
        errors << "#{rel(path)}: invalid category #{invalid.inspect} (allowed: #{ALLOWED_CATEGORIES.join(', ')})"
      end
    end
  end

  if fm.key?("formats")
    stats[:formatted_posts] += 1
    formats = fm["formats"]
    if !formats.is_a?(Array)
      errors << "#{rel(path)}: `formats` must be an array"
    else
      errors << "#{rel(path)}: `formats` must contain exactly one item" unless formats.length == 1
      invalid = formats.reject { |f| ALLOWED_FORMATS.include?(f.to_s) }
      unless invalid.empty?
        errors << "#{rel(path)}: invalid format #{invalid.inspect} (allowed: #{ALLOWED_FORMATS.join(', ')})"
      end

      if formats.map(&:to_s).include?("link")
        stats[:link_posts] += 1
        unless valid_http_url?(fm["external_url"])
          errors << "#{rel(path)}: `external_url` is required for `formats: [\\\"link\\\"]` and must be a valid http/https URL"
        end
      end
    end
  end

  if fm.key?("tags") && !fm["tags"].is_a?(Array)
    errors << "#{rel(path)}: `tags` must be an array when provided"
  end

  if fm.key?("summary") && !fm["summary"].nil? && !fm["summary"].is_a?(String)
    errors << "#{rel(path)}: `summary` must be a string when provided"
  end

  warnings << "#{rel(path)}: `url` is discouraged by spec; prefer `slug` + permalinks policy" if fm.key?("url")
end

if errors.empty?
  puts "Content validation passed."
  puts "Checked #{stats[:posts]} posts (formats: #{stats[:formatted_posts]}, link: #{stats[:link_posts]})."
  unless warnings.empty?
    puts
    puts "Warnings (#{warnings.length}):"
    warnings.each { |line| puts "  - #{line}" }
  end
  exit 0
end

puts "Content validation failed."
puts "Checked #{stats[:posts]} posts. Found #{errors.length} error(s)."
puts
errors.each { |line| puts "- #{line}" }

unless warnings.empty?
  puts
  puts "Warnings (#{warnings.length}):"
  warnings.each { |line| puts "  - #{line}" }
end

exit 1
