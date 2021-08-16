 $chaosRevertjob = {
            Start-Sleep -s {{duration}} 
            Remove-NetFirewallRule -DisplayName "CHAOS Block S3 IP address"
          }
          
          $regions = "{{regions}}".Split(",")
          $addresses = New-Object Collections.Generic.List[String]
          
          foreach ($region in $regions) {
            $addresses.Add("s3.$($region).amazonaws.com")
          }
          
          foreach ($address in $addresses) {
            $addressips = Resolve-DnsName -Name $address -Type A -DnsOnly
            foreach($addressip in $addressips.IPAddress){          
              New-NetFirewallRule -DisplayName "CHAOS Block S3 IP address" -Direction Outbound –LocalPort Any -Protocol UDP -Action Block -RemoteAddress $addressip | Out-Null
              Write-Host "Added $($addressip) for $($address) to the Firewall and Blocked for UDP"
              New-NetFirewallRule -DisplayName "CHAOS Block S3 IP address" -Direction Outbound –LocalPort Any -Protocol TCP -Action Block -RemoteAddress $addressip | Out-Null
              Write-Host "Added $($addressip) for $($address) to the Firewall and Blocked for TCP"
            }
          }
          
          Write-Host "Wating until revert command scheduling job has complete"
          do { Start-Sleep -Milliseconds 100 } until ($refjob.State -eq "Completed");
          Write-Host "Removing scheduled job"
          $refjob | Remove-Job