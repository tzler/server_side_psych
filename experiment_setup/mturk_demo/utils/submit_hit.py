"""
Automatically submit experiments (i.e. Human Intelligence Tasks, or "HITs") to Amazon Mechanical Turk. 

To prototype/troubleshoot experiments in the "sandbox" use the following arguments from the command line: 
    $ python3 submit_hit.py sandbox <n_hits_per_task> <amount>

To submit HITs as experiments online that *other people* complete use the following command:  
    $ python3 submit_hit.py live <n_hits_per_task> <amount>)

"""
import sys, os, datetime, json, boto3

def get_user_inputs(): 

    # check input from command line
    if len(sys.argv) < 4:
        # if no enough arguments, send info about calling this function
        sys.exit("""
        usage for either sandbox or live:\n
            $ python submit_hit.py sandbox <n_hits_per_task> <amount> 
            $ python submit_hit.py live <n_hits_per_task> <amount>\n""")

    else: # ask for confirmation about inputs 

        # get mturk setting --either 'sandbox' or 'live'
        context = sys.argv[1]
        # get number of hits to submit 
        n_hits = int(sys.argv[2])
        # get compensation amound 
        payment =  format(float(sys.argv[3]), '.02f')        

        if (context == 'live') or (context == 'sandbox'):
            
            # print info for HIT
            print('\nCreate %s %s Human Intelligence Tasks (i.e. HITs) for $%s each? (enter either yes or no)\n'%(
                str(n_hits), str(context), str(payment)))
            # collect user confirmation
            user_response = str(input())
            # set mturk related parameters from user input (sandbox vs. live) 
            if user_response[0].lower() == 'y':
                pass # on to the next step 
            else: 
                sys.exit('\ncareful :)\n')
     
        else: 
            sys.exit("\ncontext needs to be either 'live' or 'sandbox'\n")
    
    return context, n_hits, payment

class experiment:
    """
    An object for constructing an "External Question" 
    i.e. we want to relay online participants from mturk's servers to our servers
    code from https://stackoverflow.com/questions/46692234/how-to-submit-mechanical-turk-externalquestions-with-boto3
    """
    schema_url = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd"
    template = '<ExternalQuestion xmlns="%(schema_url)s"><ExternalURL>%%(external_url)s</ExternalURL><FrameHeight>%%(frame_height)s</FrameHeight></ExternalQuestion>' % vars()

    def __init__(self, external_url, frame_height):
        self.external_url = external_url
        self.frame_height = frame_height

    def get_as_xml(self):
        return self.template % vars(self)

def post_hits(hit_info, n_sub_hits, save_name):
    """General format for boto3 mturk interface
    - https://github.com/aws-samples/mturk-code-samples/blob/master/Python/CreateHitSample.py
    """
   
    # set platform to submit to 
    if hit_info['platform'] == 'sandbox':
        endpoint_url = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'
        external_submit = 'https://workersandbox.mturk.com/mturk/externalSubmit'
        base_url = 'https://workersandbox.mturk.com/mturk/preview?groupId='
    elif hit_info['platform'] == 'live':
        endpoint_url = 'https://mturk-requester.us-east-1.amazonaws.com'
        external_submit = "https://www.mturk.com/mturk/externalSubmit"
        base_url = 'https://www.mturk.com/mturk/preview?groupId='

    # open connection to mturk platform 
    mturk = boto3.client('mturk', 
            aws_access_key_id = access_id, 
            aws_secret_access_key = secret_key, 
            region_name='us-east-1',
            endpoint_url = endpoint_url,
            )
    
    # generate this human intelligence task (HIT) 
    HIT = mturk.create_hit(
            Question = experiment(hit_info['external_url'], hit_info['frame_height']).get_as_xml(), 
            LifetimeInSeconds = hit_info['lifetime_of_experiment'], 
            MaxAssignments = n_sub_hits, 
            Title = hit_info['title'],
            Description = hit_info['description'],
            Keywords = hit_info['keywords'],
            QualificationRequirements = hit_info['qualifications'],
            Reward = hit_info['payment_for_experiment'], 
            AssignmentDurationInSeconds= hit_info['duration_of_experiment'], 
            AutoApprovalDelayInSeconds = hit_info['approval_delay'],  
            RequesterAnnotation = hit_info['experiment_name'])
    
    # save the HIT ID for our records + to display 
    hit_info['hit_id'] = HIT['HIT']['HITId']
    # save full URL where the HIT can be found 
    hit_info['hit_url'] = "{}{}".format(base_url, HIT['HIT']['HITTypeId'])

    # we'll save this HIT info for our own records 
    record_name = '%s_%s.txt'%(hit_info['platform'], save_name)
    # if we've already used this name, load it
    if record_name in os.listdir(os.getcwd()):
        with open(record_name) as json_file: 
            turk_info = json.load(json_file)
    else:
        # create a new file, if name hasn't been used
        turk_info = {}
    # name this submission with a unique identifier
    turk_info['submission_%d'%len(turk_info.keys())] = hit_info
    # save this HIT for our own records
    with open(record_name, 'w') as outfile: 
        json.dump(turk_info, outfile)
    # print out the HIT URL on the command line 
    print('HIT_ID:', HIT['HIT']['HITId'], "\nwhich you can see here:", hit_info['hit_url'])

def generate_and_submit_hit(params, n_hits, save_name): 
    """Generates data to submit HIT + save record of the HIT to this folder"""
    
    hit_info = {} 
    # mturk description info 
    hit_info['external_url'] = "https://stanfordmemorylab.com:%s"%(os.path.join(port_number, experiment_path)) 
    hit_info['keywords'] = 'perception, reaction time  game, experiment, research'
    hit_info['description'] = 'An experiment about how the brain processes information'  
    hit_info['experiment_name'] = 'Reaction time experiment'
    hit_info['title'] = 'Helping us learn about the brain!'
    # payment and bonus info
    hit_info['payment_for_experiment'] = params['payment'] 
    # mturk interface and worker details 
    hit_info['max_assignments'] = n_hits
    hit_info['frame_height'] = 700
    hit_info['approval_rating_cutoff'] = 90
    # experimental timing details -- time is in seconds, e.g: 60 * 60 = 1 hour
    hit_info['lifetime_of_experiment'] = int( 60 * 60 * params['experiment_lifetime'])
    hit_info['duration_of_experiment'] = int( 60 * 60 * params['experiment_duration'])
    hit_info['approval_delay'] = int(1 * 30)
    # 
    hit_info['time_of_submission'] = datetime.datetime.now().strftime("%H:%M_%m_%d_%Y")
    hit_info['platform'] = params['platform']
    # add qualifications to set who can complete this experiment
    """ 
    Qualifications formatting examples/guidelines: 
    - https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html
    """
    qualification_requirements = [ 
            {
            'QualificationTypeId':"00000000000000000071",
            'Comparator':"EqualTo",
            'LocaleValues':[{ 'Country':"US"}], 
            'RequiredToPreview': True,
            },
            {
            'QualificationTypeId': '000000000000000000L0',
            'Comparator': 'GreaterThanOrEqualTo',
            'IntegerValues': [95],
            'RequiredToPreview': True, 
            }
        ]
    # save these qualifications 
    hit_info['qualifications'] = qualification_requirements 
    # post this HIT on mturk    
    post_hits(hit_info, n_hits, save_name)   

if __name__ == '__main__':
   
    # define the 'lifetime' and 'duration' of the experiment on mturk (in hours)
    params = {'experiment_lifetime':.1, 'experiment_duration':.1}
    # check that commands are in the right format and extract all experiment-related info
    params['platform'], n_hits, params['payment'] = get_user_inputs()
    # specify which port to open 
    port_number = '8888'
    # set path to experiment from open port 
    experiment_path = 'index.html'
    # name to save this HIT data to in this folder
    save_name = 'submission_records'
    
    # set path to your aws user "keys" 
    credentials= '../../credentials/aws_keys.json'
    # load your mturk-related "key" information
    with open(credentials, 'rb') as aws_keys:
        key_info = json.load(aws_keys)
        access_id = str(key_info['access_key_id'])
        secret_key = str(key_info['secret_access_key'])

    # mturk charges are larger when hits are submitted in batches > 9 
    # https://requester.mturk.com/pricing 
    # so let's set the maximum number of hits in a batch to be 9 
    max_hits = 9
    # and split up those max_hits submissions ... 
    submissions = [max_hits for i in range(n_hits//max_hits)]
    # into smaller batches that go up to but never exceed 9  
    if n_hits%max_hits: submissions.append( n_hits%max_hits)
    
    # now let's submit those batches one at a time
    for n_per_submission in submissions: 
        # use command line data to generate and submit this HIT
        generate_and_submit_hit(params, n_per_submission, save_name)
