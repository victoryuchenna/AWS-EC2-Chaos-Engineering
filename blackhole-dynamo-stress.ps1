$chaosRevertjob = {
            Start-Sleep -s {{duration}} 
            Remove-NetFirewallRule -DisplayName "CHAOS Block Dynamo IP address"
          }
          
          Write-Host "Schedule job to delete the DNS rules that will be added later"
          $refjob = Start-Job -ScriptBlock $chaosRevertjob
          
          $regions = "{{regions}}".Split(",")
          $addresses = New-Object Collections.Generic.List[String]
          foreach ($region in $regions) {
            $addresses.Add("dynamodb.$($region).amazonaws.com")
          }
          foreach ($address in $addresses) {
            $addressips = Resolve-DnsName -Name $address -Type A -DnsOnly
            foreach($addressip in $addressips.IPAddress){          
              New-NetFirewallRule -DisplayName "CHAOS Block Dynamo IP address" -Direction Outbound –LocalPort Any -Protocol UDP -Action Block -RemoteAddress $addressip | Out-Null
              Write-Host "Added $($addressip) for $($address) to the Firewall and Blocked for UDP"
              New-NetFirewallRule -DisplayName "CHAOS Block Dynamo IP address" -Direction Outbound –LocalPort Any -Protocol TCP -Action Block -RemoteAddress $addressip | Out-Null
              Write-Host "Added $($addressip) for $($address) to the Firewall and Blocked for TCP"
            }
          }