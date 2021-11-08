#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 0: Check for environment variable with contract name"
echo ---------------------------------------------------------
echo

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$CONTRACT" ] || echo "Found it! \$CONTRACT is set to [ $CONTRACT ]"

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'view' functions on the contract"
echo
echo "(run this script again to see changes made by this file)"
echo ---------------------------------------------------------
echo

#near view $CONTRACT helloWorld

near call dev-1636061228659-36397651617537 getAllMessages --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 saveMyMessage '{"message":"saying hey a Xth time "}' --accountId comtechnet.testnet

echo
echo

#near view $CONTRACT read '{"key":"some-key"}'

echo
echo
echo ---------------------------------------------------------
echo "Step 2: Call 'change' functions on the contract"
echo ---------------------------------------------------------
echo

# the following line fails with an error because we can't write to storage without signing the message
# --> FunctionCallError(HostError(ProhibitedInView { method_name: "storage_write" }))
# near view $CONTRACT write '{"key": "some-key", "value":"some value"}'
#near call $CONTRACT write '{"key": "some-key", "value":"some value"}' --accountId $CONTRACT

near call dev-1636061228659-36397651617537 createGame '{"_initBet":"10"}' --amount 10 --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 round1Game '{"_gameId":39925073}' --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 round2Game '{"_gameId":39925073, "_choiceHigh":true, "_betAmount":"20"}' --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 whatIsGameStatus '{"_gameId":39925073}' --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 endGame '{"_gameId":39925073}' --accountId comtechnet.testnet

# Games 39925073(pending) 1666447260(ended) 1445429373(created) 4048342683(created)
# Games 1822478106(ended) 3707585202(ended) 143243604(ended too early) 3848116401(ended)
# 1913854565 (created) 4089969929(ended) # NEED Logging to tell/show internal card values, etc.

echo
echo "now run this script again to see changes made by this file"
exit 0
