

GET_SUPPLIER_LIST
Published Jun 18
dev-10
Edit

Share


GET_SUPPLIER_LIST



By Guenter

2

Add a reaction
Overview
Provides a list of suppliers

Business Logic
N/A

Data
 

XML-IN

XML-IN

XML-OUT

XML-OUT (relevant tags only)



XML-OUT (complete)

Messages
User Messages
Message

CL

Description


Login successful
<MESSAGEAREA NAME="USER_MESSAGES" ID="" VERSION="1.00">
		<MESSAGES>
			<MSG NAME="KERNEL.INTERACTIONUSEROPERATION.NEW_LOGIN_SUCCESSFUL">
				<CRITICALLEVEL>0</CRITICALLEVEL>
				<CAPTION>
					<![CDATA[Login was successful]]>
				</CAPTION>
				<DESCRIPTION></DESCRIPTION>
				<OCCURANCE></OCCURANCE>
				<DATAREFERENCE USED="NO" />
			</MSG>
		</MESSAGES>
		<DEBUG_INFORMATION>
			<INFO />
		</DEBUG_INFORMATION>
	</MESSAGEAREA>

0

 


Last session not correct terminated
<MESSAGEAREA NAME="USER_MESSAGES" ID="" VERSION="1.00">
			<MESSAGES>
				<MSG NAME="KERNEL.INTERACTIONUSEROPERATION.NO_LOGOUT_FOUND">
					<CRITICALLEVEL>0</CRITICALLEVEL>
					<CAPTION>
						<![CDATA[Your last session wasn't finished correctly or you're already logged in on another computer!]]>
					</CAPTION>
					<DESCRIPTION>Für einen alten Login wurde kein passender Logout gefunden!</DESCRIPTION>
					<OCCURANCE></OCCURANCE>
					<DATAREFERENCE USED="NO" />
				</MSG>
			</MESSAGES>
			<DEBUG_INFORMATION>
				<INFO />
			</DEBUG_INFORMATION>
		</MESSAGEAREA>

0

 


Login credentials incorect
	<MESSAGES>

				<MSG NAME="KERNEL.INTERACTIONUSEROPERATION.USERNAME_PASSWORD_INCORRECT">

					<CRITICALLEVEL>1</CRITICALLEVEL>

					<CAPTION>

						<![CDATA[Your username or your password is incorrect!]]>

					</CAPTION>

					<DESCRIPTION>Das Passwort passt nicht zum Usernamen!</DESCRIPTION>

					<OCCURANCE></OCCURANCE>

					<DATAREFERENCE USED="NO" />

				</MSG>

			</MESSAGES>

			<DEBUG_INFORM

1

 

System Messages
Message

CL

Description

Message

CL

Description


API OK
	<MESSAGEAREA NAME="SYSTEM_MESSAGES" ID="" VERSION="1.00">
		<MESSAGES>
			<MSG NAME="FACADE.CENTER.CALL_BNO_OK">
				<CRITICALLEVEL>0</CRITICALLEVEL>
				<CAPTION>
					<![CDATA[The BNO was called successfully from facade!]]>
				</CAPTION>
				<DESCRIPTION>Aufruf des BNO war ok.</DESCRIPTION>
				<OCCURANCE></OCCURANCE>
				<DATAREFERENCE USED="NO" />
			</MSG>
		</MESSAGES>
		<DEBUG_INFORMATION>
			<INFO />
		</DEBUG_INFORMATION>
	</MESSAGEAREA>