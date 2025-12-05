# banco-dados-cic

Projeto desenvolvido para a disciplina de Banco de Dados (Semestre: 2025.2) da Universidade de Brasília (UnB) pelos seguintes alunos:

- Bruno Gabriel Lourenço de Muniz
- Carlos Eduardo Souza

(Link do projeto no GitHub: https://github.com/Carlos-E-Souza/banco-dados-cic)

## Introdução (Tema: Sistema de Ouvidoria)

O projeto busca desenvolver um sistema de ouvidoria, o qual tem como objetivo coletar as avaliações e ocorrências reportadas pelos moradores de forma unificada, visando facilitar o processo de feedback, permitir que a administração possa monitorar e melhorar seus serviços com base no feedback recebido além de promover uma maior transparência e responsabilidade, já que os usuários podem acompanhar outras avaliações e ocorrências mais leves de sua região.

Para tal, projetamos o banco de dados conforme o modelo entidade relacionamento e o modelo relacional apresentado a seguir:

![Modelo Entidade Relacionamento](Projeto1DB_MER.svg) \
\
![Modelo Relacional](Projeto1BD_MR.svg)\
\
![Diagrama Interface Persistência](DiagramaInterfacePersistencia.svg)
## Exemplo Prático de Uso

Considere os seguintes cenários de uso do sistema de ouvidoria:

1. **Registro de Avaliação do Atendimento de uma UPA**: 
   - Um morador visita uma Unidade de Pronto Atendimento (UPA) e deseja avaliar o atendimento recebido. Ele acessa o sistema de ouvidoria, seleciona a aba de avaliações, seleciona a UPA específica pela localização, e preenche um formulário avaliando aspectos como tempo de espera, qualidade e organização do atendimento além de deixar um comentário explicando a sua experiência. Após enviar a avaliação, o sistema armazena os dados no banco de dados, associando a avaliação ao morador e à UPA.

2. **Registro de Ocorrência de Iluminação Pública Deficiente**:
   - Um morador percebe que uma rua em seu bairro está com a iluminação pública deficiente, o que representa um risco para a segurança. Ele acessa o sistema de ouvidoria, seleciona a aba de ocorrências, e preenche um formulário detalhando o problema, incluindo a localização exata e uma descrição do problema. Após enviar a ocorrência, o sistema armazena os dados no banco de dados, associando a ocorrência ao morador, à localização específica e à CEB, órgão responsável pela iluminação pública que poderá tomar as devidas providências e atualizar o status da ocorrência.

3. **Consulta de Avaliações e Ocorrências por Localização**:
   - Um morador deseja verificar as avaliações e ocorrências registradas em sua região antes de visitar um serviço público. Ele acessa o sistema de ouvidoria, seleciona a opção de consulta por localização, insere o endereço desejado, e o sistema retorna uma lista de avaliações e ocorrências associadas àquela localização. O morador pode então ler os comentários e verificar o status das ocorrências para tomar decisões informadas sobre os serviços públicos na área.


