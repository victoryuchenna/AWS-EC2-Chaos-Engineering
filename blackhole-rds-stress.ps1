
$chaosRevertjob = {
  Start-Sleep -s {{duration}} 
  Remove-NetFirewallRule -DisplayName "CHAOS Block RDS"
}
Write-Host "Schedule job to delete the DNS rules that will be added later"
$refjob = Start-Job -ScriptBlock $chaosRevertjob
          
New-NetFirewallRule -DisplayName "CHAOS Block RDS" -Direction Outbound –LocalPort 3306 -Protocol TCP -Action Block | Out-Null
New-NetFirewallRule -DisplayName "CHAOS Block RDS" -Direction Inbound –LocalPort 3306 -Protocol TCP -Action Block | Out-Null
Write-Host "Blocked Port 3306 Outbound and Inbound"
Write-Host "Wating until revert command scheduling job has complete"
do { Start-Sleep -Milliseconds 100 } until ($refjob.State -eq "Completed");

Write-Host "Removing scheduled job"
$refjob | Remove-Job