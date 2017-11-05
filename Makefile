# This file is part of fightcode2.
# https://github.com/rfloriano/remote-http-middleware

# Licensed under the MIT license:
# http://www.opensource.org/licenses/MIT-license
# Copyright (c) 2017 Rafael Floriano da Silva rflorianobr@gmail.com
#

# lists all available targets
list:
	@sh -c "$(MAKE) -p no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'make\[1\]' | grep -v 'Makefile' | sort"
# required for list
no_targets__:


# install all dependenciesZ
setup:
	@npm install .

# test your application (tests in the tests/ directory)
test:
	@CI=true MAKE unit

unit:
	@npm test

watch: unit
