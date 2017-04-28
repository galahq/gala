json.key_format! camelize: :lower
json.needs_pretest @deployment.reader_needs_pretest? current_reader
json.needs_posttest @deployment.reader_needs_posttest? current_reader
