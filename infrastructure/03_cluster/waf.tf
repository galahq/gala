
# resource "aws_wafv2_rule_group" "rate_limit_rule" {
#   name     = "${var.env_name}-rate-limit-rule"
#   scope    = "REGIONAL"
#   capacity = 50

#   rule {
#     name     = "RateLimit"
#     priority = 1
#     action {
#       block {}
#     }

#     statement {
#       rate_based_statement {
#         limit = 10
#         aggregate_key_type = "FORWARDED_IP"
        
#         forwarded_ip_config {
#           header_name = "X-Forwarded-For"
#           fallback_behavior = "MATCH"
#         }

#         scope_down_statement {
#           byte_match_statement {
#             search_string = "admin"
#             field_to_match {
#               uri_path {}
#             }
#             text_transformation {
#               priority = 0
#               type     = "NONE"
#             }
#             positional_constraint = "CONTAINS"
#           }
#         }
#       }
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AdminPathRateLimitMetric"
#       sampled_requests_enabled   = true
#     }
#   }

#   rule {
#     name     = "IPBlock"
#     priority = 2
#     action {
#       block {}
#     }

#     statement {
#       ip_set_reference_statement {
#         arn = aws_wafv2_ip_set.ip_blocked.arn
#       }
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "IPBlockMetric"
#       sampled_requests_enabled   = true
#     }
#   }

#   visibility_config {
#     cloudwatch_metrics_enabled = true
#     metric_name                = "RateLimitRuleGroup"
#     sampled_requests_enabled   = true
#   }
# }

# resource "aws_wafv2_web_acl" "web_acl" {
#   name     = "${var.env_name}-web-acl"
#   scope    = "REGIONAL"

#   default_action {
#     allow {}
#   }
#   visibility_config {
#     cloudwatch_metrics_enabled = true
#     metric_name                = "WebACL"
#     sampled_requests_enabled   = true
#   }
# }


# resource "aws_wafv2_web_acl_association" "alb_association" {
#   resource_arn = aws_lb.lb.arn
#   web_acl_arn  = aws_wafv2_web_acl.web_acl.arn
# }

# resource "aws_wafv2_ip_set" "ip_blocked" {
#   name    = "${var.env_name}-ip-blocked-set"
#   scope   = "REGIONAL"
#   ip_address_version = "IPV4"

#   addresses = [var.app_vpc_cidr_block]  # Replace with actual IPs or subnets to block
#   #addresses = ["0.0.0.0/32"]
# }