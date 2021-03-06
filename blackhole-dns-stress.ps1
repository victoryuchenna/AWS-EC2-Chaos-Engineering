$chaosRevertjob = {
              Start-Sleep -s {{duration}} 
              Remove-NetFirewallRule -DisplayName "CHAOS Block DNS IP address"
          }          
          
          Write-Host "Schedule job to delete the DNS rules that will be added later"
          $refjob = Start-Job -ScriptBlock $chaosRevertjob
          
          $addresses = Get-DnsClientServerAddress -AddressFamily "IPv4" | select -First 1 | select -ExpandProperty ServerAddresses 
          Write-Host "Got DNS address to block: $addresses"
        
          Write-Host "Add UDP firewall rule to block $addresses"
          New-NetFirewallRule -DisplayName "CHAOS Block DNS IP address" -Direction Outbound –LocalPort Any -Protocol UDP -Action Block -RemoteAddress $addresses | out-null
          
          Write-Host "Add TCP firewall rule to block $addresses"
          New-NetFirewallRule -DisplayName "CHAOS Block DNS IP address" -Direction Outbound –LocalPort Any -Protocol TCP -Action Block -RemoteAddress $addresses | out-null
          Write-Host "Checking DNS, it should fail"
          if (Resolve-DnsName -Name www.amazon.com -DnsOnly -ErrorAction SilentlyContinue) { Write-Host 'SUCCESS: DNS Query Attempt was successful'} else {Write-Host 'FAIL: DNS Query Attempt was Unsuccessful'}
          Write-Host "Wating until revert command scheduling job has complete"
          do { Start-Sleep -Milliseconds 100 } until ($refjob.State -eq "Completed");
          
          Write-Host "Removing scheduled job"
          $refjob | Remove-Job
          
          Write-Host "Check DNS, it should be successful"
          if (Resolve-DnsName -Name www.amazon.com -DnsOnly -ErrorAction SilentlyContinue) { Write-Host 'SUCCESS: DNS Query Attempt was successful'} else {Write-Host 'FAIL: DNS Query Attempt was Unsuccessful'}