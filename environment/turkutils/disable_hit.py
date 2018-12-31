# /usr/bin/python
from boto.mturk.connection import MTurkConnection
from boto.mturk.question import ExternalQuestion
import boto.mturk.qualification as mtqu
from dateutil.parser import *
import numpy as np
import sys, os, datetime

credential_location = '../credentials/'
lab_rootkey = 'snail_rootkey.npy'
directory_location = '..'
n_hours_to_complete_hit = 2
n_hours_to_accept_hit = 1
key_info = np.load(credential_location + lab_rootkey).item()
host = 'mechanicalturk.sandbox.amazonaws.com'

# send info about inputs if they're aren't enough
if len(sys.argv) < 2:

    sys.exit("""\nusage for either sandbox or live:\n\n\t$ python disable_hit.py <hit_id>\n""")

else: # make sure data are formated correctely, and we're in the right context

    # format user input
    hit_id =  sys.argv[1]


    mturk = MTurkConnection(aws_access_key_id=key_info['AWSAccessKeyId'],
                            aws_secret_access_key=key_info['AWSSecretKey'],
                            host=host)

    mturk.disable_hit(hit_id)
