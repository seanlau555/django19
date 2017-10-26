from django import template

register = template.Library()

@register.filter
def unescape_quotes(s):
	html_codes = (
		('"', '&quot;'),
	)
	for code in html_codes:
		s = s.replace(code[1], code[0])
	return s